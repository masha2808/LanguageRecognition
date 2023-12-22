import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LanguageRecognitionDto } from './language-recognition.dto';
import { PrismaService } from 'src/prisma';
import {
  AlternativeLanguageCodes,
  AudioLanguageList,
  AuthorizationUserData,
  RecognizedLanguage,
  TextLanguageList,
  TypeEnum,
} from './models';
import { SpeechClient } from '@google-cloud/speech';
import { Multer } from 'multer';
import LanguageDetect from 'languagedetect';

@Injectable()
export class LanguageRecognitionService {
  constructor(private prismaService: PrismaService) {}

  recognizeLanguage = async (
    file: Multer.File,
    data: LanguageRecognitionDto,
    user: AuthorizationUserData,
  ) => {
    const recognizedLanguage: RecognizedLanguage = {
      text: '',
      language: '',
    };
    if (data.type === TypeEnum.audio) {
      if (!file) {
        throw new HttpException('File is required.', HttpStatus.BAD_REQUEST);
      }

      const fileNameArray = file.originalname.split('.');
      if (fileNameArray[fileNameArray.length - 1] !== 'wav') {
        throw new HttpException(
          'Invalid file type. Only WAV files are supported for audio recognition.',
          HttpStatus.BAD_REQUEST,
        );
      }

      try {
        const client = new SpeechClient();

        const config = {
          encoding: 'LINEAR16' as const,
          sampleRateHertz: 44100,
          languageCode: 'en-US',
          alternativeLanguageCodes: AlternativeLanguageCodes,
        };

        const audio = {
          content: file.buffer.toString('base64'),
        };

        const request = {
          config: config,
          audio: audio,
        };

        const [response] = await client.recognize(request);

        const transcription = response.results
          .map((result) => result.alternatives[0].transcript)
          .join('\n');

        const languageCode = response.results[0].languageCode;

        recognizedLanguage.text = transcription;
        recognizedLanguage.language = AudioLanguageList[languageCode];
        recognizedLanguage.file_name = file.originalname;
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    } else {
      try {
        const lngDetector = new LanguageDetect();
        const languageList = lngDetector.detect(data.text);

        if (!Array.isArray(languageList) || languageList.length === 0) {
          throw new HttpException(
            'Language was not detected.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const textLanguage = languageList.reduce(
          (recognizedLanguage, [language, value]) => {
            if (
              Object.keys(TextLanguageList).includes(language) &&
              value > recognizedLanguage.value
            ) {
              return { language, value };
            }
            return recognizedLanguage;
          },
          { language: null, value: -1 },
        ).language;

        recognizedLanguage.text = data.text;
        recognizedLanguage.language = TextLanguageList[textLanguage];
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    if (user) {
      try {
        await this.prismaService.query.create({
          data: {
            ...recognizedLanguage,
            type: data.type,
            user_id: user.id,
          },
        });
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    return recognizedLanguage;
  };

  getQueryHistory = async (user: AuthorizationUserData) => {
    if (!user) {
      throw new HttpException('User is not authorized', HttpStatus.BAD_REQUEST);
    }

    let queryHistory;

    try {
      queryHistory = await this.prismaService.query.findMany({
        where: {
          user_id: user.id,
        },
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return {
      queryHistory,
    };
  };
}
