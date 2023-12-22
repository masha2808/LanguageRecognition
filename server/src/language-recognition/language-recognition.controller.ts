import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthorizationRequest } from './language-recognition.middleware';
import { LanguageRecognitionService } from './language-recognition.service';
import { LanguageRecognitionDto } from './language-recognition.dto';
import { ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('language')
export class LanguageRecognitionController {
  constructor(
    private readonly languageRecognitionService: LanguageRecognitionService,
  ) {}

  @Post('recognize')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Language was recognized',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  recognizeLanguage(
    @UploadedFile() file: Multer.File,
    @Body() data: LanguageRecognitionDto,
    @Req() req: AuthorizationRequest,
  ) {
    return this.languageRecognitionService.recognizeLanguage(
      file,
      data,
      req.user,
    );
  }

  @Get('query-history')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Query history was found',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  getQueryHistory(@Req() req: AuthorizationRequest) {
    return this.languageRecognitionService.getQueryHistory(req.user);
  }
}
