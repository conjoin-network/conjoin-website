import prisma from '../lib/prisma.js';

async function main(){
  try{
    const crmCount = await prisma.crmLead.count();
    const leadCount = await prisma.lead.count().catch(()=>null);
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
