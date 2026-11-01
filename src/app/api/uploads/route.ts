import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

const types=new Set(["image/png","image/jpeg","image/webp","application/pdf"]);
const limit=10*1024*1024;
export async function POST(request:Request){
 const cloud=process.env.CLOUDINARY_CLOUD_NAME,key=process.env.CLOUDINARY_API_KEY,secret=process.env.CLOUDINARY_API_SECRET;
 if(!cloud||!key||!secret)return NextResponse.json({error:"Uploads are not configured yet."},{status:503});
 const form=await request.formData().catch(()=>null);const file=form?.get("file");
 if(!(file instanceof File)||!types.has(file.type)||file.size>limit)return NextResponse.json({error:"Upload a PNG, JPG, WebP, or PDF under 10 MB."},{status:400});
 const timestamp=Math.floor(Date.now()/1000).toString(),folder="edulearn/attachments";
 const signature=createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
 const body=new FormData();body.set("file",file);body.set("api_key",key);body.set("timestamp",timestamp);body.set("folder",folder);body.set("signature",signature);
 const kind=file.type==="application/pdf"?"raw":"image";
 const response=await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${kind}/upload`,{method:"POST",body});const data=await response.json().catch(()=>null);
 if(!response.ok)return NextResponse.json({error:"The file could not be uploaded."},{status:502});
 return NextResponse.json({url:data.secure_url,name:file.name,type:file.type,bytes:file.size},{status:201});
}
