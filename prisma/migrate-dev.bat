ECHO @ Starting migration script


ECHO @ Moving default ENV
cd ..
move .env .env_temporary
cd ./prisma


ECHO @ Loading DEV environment
move .dev_env .env
cd ..


ECHO @ Creating migrations
call npx prisma migrate save --experimental


ECHO @ Running migrations on DEV
call npx prisma migrate up --experimental


ECHO @ Loading TEST environment
cd .\prisma
move .env .dev_env
move .test_env .env
cd ..


ECHO @ Creating migrations
call npx prisma migrate save --experimental


ECHO @ Running migrations on TEST
call npx prisma migrate up --experimental


ECHO @ Returning environments
cd .\prisma
move .env .dev_env


ECHO @ Generating Prisma client
cd ..
call npx prisma generate


ECHO @ Restoring default ENV
move .env_temporary .env
cd ./prisma


ECHO @ Done
EXIT /B 0