import { Module } from '@nestjs/common';
import { AuthorizeModule } from './authorize/authorize.module';

@Module({
  imports: [AuthorizeModule]
})
export class AppModule {}
