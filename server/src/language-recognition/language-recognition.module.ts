import { MiddlewareConsumer, Module } from '@nestjs/common';
import { LanguageRecognitionController } from './language-recognition.controller';
import { LanguageRecognitionService } from './language-recognition.service';
import { LanguageRecognitionMiddleware } from './language-recognition.middleware';

@Module({
  controllers: [LanguageRecognitionController],
  providers: [LanguageRecognitionService],
})
export class LanguageRecognitionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanguageRecognitionMiddleware).forRoutes('*');
  }
}
