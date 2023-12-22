import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, ValidateIf } from 'class-validator';
import { TypeEnum } from './models';

export class LanguageRecognitionDto {
  @ApiProperty()
  @IsEnum(TypeEnum)
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @ValidateIf((params) => params.type === TypeEnum.text)
  text: string;
}
