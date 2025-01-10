import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({ required: false })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @IsOptional()
  newPassword?: string;
}
