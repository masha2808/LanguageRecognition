import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication';
import { PrismaModule } from './prisma';
import { LanguageRecognitionModule } from './language-recognition/language-recognition.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from './multer-options';
import { FileInterceptor } from './file.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MulterModule.register(multerOptions),
    PrismaModule,
    AuthenticationModule,
    LanguageRecognitionModule,
  ],
  controllers: [AppController],
  providers: [AppService, FileInterceptor],
})
export class AppModule {}
