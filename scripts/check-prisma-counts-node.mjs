import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main(){
  try{
    const crmCount = await prisma.crmLead.count();
    let leadCount = null;
    try { leadCount = await prisma.lead.count(); } catch(e){ leadCount = null; }
    console.log('crmLead.count=', crmCount);
    console.log('lead.count=', leadCount);
  }catch(e){
    console.error('ERROR', e);
    process.exit(1);
  }finally{
    await prisma.$disconnect();
  }
}
main();
