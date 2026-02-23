import { Module } from '@nestjs/common';
import { TodoListsModule } from './todo-lists/todo-lists.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..','assets'), // Path to your assets folder
      serveRoot: '/assets', // Route to serve static assets
      
    }),
    TodoListsModule,
  ],
})
export class AppModule {}
