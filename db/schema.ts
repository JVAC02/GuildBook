import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const members=sqliteTable('members',{
  userId:text('user_id').primaryKey(), email:text('email').notNull(), name:text('name').notNull(),
  blocked:integer('blocked').notNull().default(0), createdAt:text('created_at').notNull(), lastSeen:text('last_seen').notNull()
},t=>[index('members_email_idx').on(t.email)]);
export const owner=sqliteTable('site_owner',{key:text('key').primaryKey(),userId:text('user_id').notNull()});
export const audit=sqliteTable('access_audit',{
  id:integer('id').primaryKey({autoIncrement:true}),actor:text('actor').notNull(),target:text('target').notNull(),
  action:text('action').notNull(),createdAt:text('created_at').notNull()
});
