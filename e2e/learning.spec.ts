import "dotenv/config";
import { test, expect } from "@playwright/test";
import postgres from "postgres";
import { randomUUID } from "node:crypto";
const database=postgres(process.env.DATABASE_URL!,{max:1});
test.afterAll(async()=>{await database.end();});
const teaching={reply:"A coefficient tells you how many copies of a variable there are. In 3x, the coefficient is 3. So 3x + 2x means three copies plus two copies: 5x.",difficultyAreas:["collecting like terms"],readiness:"building",nextQuestion:"Simplify 4x + 3x.",quizPlan:{count:5,focus:["collecting like terms"]}};
test("topic context, optional notes, chat recovery, and refresh stay connected",async({page})=>{
 await page.goto("/");await page.getByRole("link",{name:"Start learning",exact:false}).click();
 await expect(page).toHaveURL(/learn/);
 await page.getByRole("article").filter({has:page.getByRole("heading",{name:"Cells and organisation"})}).getByRole("link",{name:"Learn this topic"}).click();
 await expect(page.getByText("Cells and organisation",{exact:true}).first()).toBeVisible();
 await page.getByText("Add your class notes").click();await page.getByLabel("Your notes").fill("The nucleus controls cell activity.");
 await page.route("**/api/tutor",route=>route.fulfill({status:502,json:{error:"Tutor is temporarily unavailable. Please retry."}}));
 await page.getByLabel("Your message to the tutor").fill("What does the nucleus do?");
 await page.getByRole("button",{name:"Send",exact:true}).click();
 await expect(page.getByRole("alert").filter({hasText:"temporarily unavailable"})).toBeVisible();
 await expect(page.getByLabel("Your message to the tutor")).toHaveValue("What does the nucleus do?");
 await page.unroute("**/api/tutor");
 await page.route("**/api/tutor",route=>route.fulfill({json:{...teaching,reply:"The nucleus helps control the cell by holding its genetic instructions."}}));
 await page.getByRole("button",{name:"Send",exact:true}).click();await expect(page.getByRole("log")).toContainText("genetic instructions");
 await page.reload();await expect(page.getByRole("log")).toContainText("genetic instructions");await page.getByText("Add your class notes").click();await expect(page.getByLabel("Your notes")).toHaveValue("The nucleus controls cell activity.");
});
test("account sign-in is explicit and rejects forged identity",async({page,request})=>{
 await page.goto("/account");
 await page.getByRole("button",{name:"New here? Create an account"}).click();
 await page.getByLabel("Your name").fill("Flow Test");
 await page.getByLabel("Email",{exact:true}).fill("flow-"+randomUUID()+"@example.com");
 await page.getByLabel("Password",{exact:true}).fill("A-test-password-2026!");
 await page.getByRole("button",{name:"Create account",exact:true}).click();
 await expect(page).toHaveURL(/progress/);await expect(page.getByText("Your first result starts here.")).toBeVisible();
 const forged=await request.get("/api/progress",{headers:{cookie:"edulearn_user=4cde1643-5586-4444-8852-ec9797dec3f1"}});
 expect(forged.status()).toBe(401);
 await page.goto("/account");await page.getByRole("button",{name:"Sign out",exact:true}).click();
 await expect(page).toHaveURL(/\/$/);await expect(page.getByRole("link",{name:"Sign in",exact:true})).toBeVisible();
});
test("targeted practice protects keys, grades once, survives refresh, and returns to tutor",async({page,context,request})=>{
 const owner=randomUUID(),id=randomUUID();
 const questions=Array.from({length:5},(_,i)=>({question:"Simplify "+(i+2)+"x + 2x.",options:[(i+4)+"x",(i+2)+"x","2x","x"],answer:0,explanation:"Add the coefficients because both terms have the same variable x.",skill:"collecting like terms"}));
 await database`insert into practice_quizzes (id,owner,topic,questions,expires_at) values (${id},${owner},'Algebraic expressions',${database.json(questions)},now()+interval '1 hour')`;
 await context.addCookies([{name:"edulearn_practice",value:owner,url:"http://localhost:3003",httpOnly:true,sameSite:"Lax"}]);
 await page.goto("/tutor?topic=Algebraic%20expressions");
 await page.route("**/api/tutor",route=>route.fulfill({json:teaching}));
 await page.getByRole("button",{name:"Show me a worked example"}).click();
 await expect(page.getByRole("log")).toContainText("coefficient");
 await page.route("**/api/practice",async route=>{
  const body=route.request().postDataJSON();
  if(body?.action==="submit"){await route.continue();return;}
  expect(body.topic).toBe("Algebraic expressions");expect(body.focus).toContain("collecting like terms");
  await route.fulfill({status:201,json:{id}});
 });
 await page.getByRole("button",{name:"Practise this topic"}).click();
 await expect(page).toHaveURL(new RegExp("/practice\\?id="+id));
 const publicResponse=await page.request.get("/api/practice?id="+id);
 const publicData=await publicResponse.json();expect(publicData.questions[0]).not.toHaveProperty("answer");expect(publicData.questions[0]).not.toHaveProperty("explanation");
 expect((await request.get("/api/practice?id="+id)).status()).toBe(404);
 for(let i=0;i<5;i++){await page.getByRole("radio").first().check();if(i<4)await page.getByRole("button",{name:"Next question"}).click();}
 await page.reload();await expect(page.getByRole("radio").first()).toBeChecked();
 for(let i=0;i<4;i++)await page.getByRole("button",{name:"Next question"}).click();
 await page.getByRole("button",{name:"Submit practice",exact:true}).click();
 await expect(page.getByRole("heading",{name:"5 out of 5"})).toBeVisible();
 const replay=await page.request.post("/api/practice",{data:{action:"submit",id,answers:[1,1,1,1,1]}});
 expect((await replay.json()).score).toBe(5);
 await page.reload();await expect(page.getByRole("heading",{name:"5 out of 5"})).toBeVisible();
 await page.getByRole("link",{name:"Review with my tutor"}).click();await expect(page.getByRole("log")).toContainText("coefficient");
 await database`delete from practice_quizzes where id=${id}`;
});
test("mobile navigation and guest progress have clear next actions",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/learn");await expect(page.getByRole("link",{name:"Progress",exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBeFalsy();
 await page.getByRole("link",{name:"Progress",exact:true}).click();
 await expect(page.getByRole("link",{name:"Sign in or create an account"})).toBeVisible();
});
