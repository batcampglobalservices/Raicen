import { test, expect } from "@playwright/test";
test.use({serviceWorkers:"allow"});
test("offline fallback does not cache learning or private API pages",async({page,context})=>{
 await page.goto("/learn");
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.reload();
 await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
 const cached=await page.evaluate(async()=>{const keys=await caches.keys();return (await Promise.all(keys.map(async key=>(await (await caches.open(key)).keys()).map(r=>new URL(r.url).pathname)))).flat();});
 expect(cached).not.toContain("/learn");expect(cached.some(p=>p.startsWith("/api/"))).toBeFalsy();
 await context.setOffline(true);
 await page.goto("/learn");
 await expect(page.getByRole("heading",{name:"You’re offline."})).toBeVisible();
 await context.setOffline(false);
});
