import { chromium, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
const baseURL=process.env.BASE_URL??"http://localhost:3003";
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({baseURL,serviceWorkers:"block",viewport:{width:1440,height:1000}});
 const page=await context.newPage();
 const folder=process.env.SCREENSHOT_DIR;
 const capture=async name=>{if(folder)await page.screenshot({path:folder+"/"+name+".png",fullPage:true});};
 await page.goto("/tutor?topic=Algebraic%20expressions");
 await expect(page.getByRole("button",{name:"Show me a worked example"})).toBeEnabled();
 await page.getByLabel("Your message to the tutor").fill("Explain 3x plus 2x in one short worked example.");
 await page.getByRole("button",{name:"Send",exact:true}).click();
 await expect(page.getByRole("button",{name:"Practise this topic"})).toBeEnabled({timeout:55000});
 await capture("03-tutor");
 console.log("Live tutor responded.");
 const auth=await page.request.post("/api/auth/register",{data:{name:"Journey verification",email:"journey-"+randomUUID()+"@example.com",password:randomUUID()}});
 if(!auth.ok())throw Error("Test account registration failed: "+auth.status());
 await page.getByRole("button",{name:"Practise this topic"}).click();
 await Promise.race([
  page.waitForURL(/practice\?id=/,{timeout:100000}),
  page.locator(".flow-error").waitFor({state:"visible",timeout:100000}).then(async()=>{throw Error(await page.locator(".flow-error").innerText());}),
 ]);
 await page.getByRole("radio").first().waitFor();
 await capture("04-practice");
 const id=new URL(page.url()).searchParams.get("id");
 const quiz=await (await page.request.get("/api/practice?id="+id)).json();
 console.log("Generated and independently reviewed questions:",JSON.stringify(quiz.questions));
 for(let i=0;i<5;i++){
  await page.getByRole("radio").first().check();
  if(i<4)await page.getByRole("button",{name:"Next question"}).click();
 }
 await page.getByRole("button",{name:"Submit practice",exact:true}).click();
 await page.getByText("Saved to your learning record.").waitFor({timeout:20000});
 await capture("05-result");
 await page.getByRole("link",{name:"See saved progress"}).click();
 await page.getByRole("heading",{name:"Recent practice"}).waitFor();
 await capture("06-progress");
 await page.setViewportSize({width:390,height:844});
 await page.goto("/tutor");
 await page.getByRole("log").waitFor();
 await capture("07-mobile");
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error("Mobile content overflows");
 console.log("PASS: real Groq teaching → reviewed generated quiz → server grading → persisted progress → mobile tutor.");
} finally {await browser.close();}
