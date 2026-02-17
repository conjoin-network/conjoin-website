import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main(){
  try{
    const rows = await prisma.crmLead.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
    console.log(rows.map(r => ({ leadId: r.id, name: r.name, phone: r.phone, email: r.email, city: r.city, status: r.status, createdAt: r.createdAt })));
  }catch(e){
    console.error(e);
    process.exit(1);
  }finally{
    await prisma.$disconnect();
  }
}
main();
