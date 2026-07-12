import { PrismaClient } from '@prisma/client';
import { syncToFirebase, deleteFromFirebase } from './firebase';

const prismaClientSingleton = () => {
  const client = new PrismaClient();

  // Middleware to sync database changes automatically to Firebase Realtime Database
  client.$use(async (params, next) => {
    const result = await next(params);

    const writeActions = ['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany'];
    if (params.model && writeActions.includes(params.action)) {
      const modelName = params.model.toLowerCase();
      
      const triggerFirebaseSync = async () => {
        const isBulk = params.action.endsWith('Many') || !result || (!result.id && !params.args.where?.id);
        
        if (isBulk) {
          const dbModel = (client as any)[modelName];
          if (dbModel && typeof dbModel.findMany === 'function') {
            const allRecords = await dbModel.findMany();
            const mapped: { [key: string]: any } = {};
            allRecords.forEach((rec: any) => {
              if (rec.id) mapped[rec.id] = rec;
            });
            await syncToFirebase(`database/${modelName}`, mapped);
          }
        } else {
          const recordId = result?.id || params.args.where?.id;
          if (recordId) {
            if (params.action === 'delete') {
              await deleteFromFirebase(`database/${modelName}/${recordId}`);
            } else {
              const dbModel = (client as any)[modelName];
              if (dbModel && typeof dbModel.findUnique === 'function') {
                const freshRecord = await dbModel.findUnique({ where: { id: recordId } });
                if (freshRecord) {
                  await syncToFirebase(`database/${modelName}/${recordId}`, freshRecord);
                } else {
                  await deleteFromFirebase(`database/${modelName}/${recordId}`);
                }
              }
            }
          }
        }
      };

      triggerFirebaseSync().catch((err) => {
        console.error('[Prisma Middleware] Firebase sync failure:', err);
      });
    }

    return result;
  });

  return client;
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
