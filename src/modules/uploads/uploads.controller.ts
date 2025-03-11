import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Body,
  UseGuards,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadFileDto, UploadFilesDto } from './dto/upload-file.dto';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('single')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tải lên một file' })
  @ApiResponse({ status: 201, description: 'File đã được tải lên thành công.' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('folder') folder: string = 'products',
  ) {
    if (!file) {
      throw new BadRequestException('File không được cung cấp');
    }

    const fileUrl = await this.uploadsService.uploadSingleFile(file, folder);
    return { url: fileUrl };
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tải lên nhiều file' })
  @ApiResponse({
    status: 201,
    description: 'Các file đã được tải lên thành công.',
  })
  @UseInterceptors(FilesInterceptor('files', 5)) // Tối đa 5 file
  async uploadMultipleFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @Body('folder') folder: string = 'products',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file nào được cung cấp');
    }

    const fileUrls = await this.uploadsService.uploadMultipleFiles(
      files,
      folder,
    );
    return { urls: fileUrls };
  }

  @Delete(':fileUrl')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa file' })
  @ApiResponse({ status: 200, description: 'File đã được xóa thành công.' })
  async deleteFile(@Param('fileUrl') fileUrl: string) {
    await this.uploadsService.deleteFile(fileUrl);
    return { message: 'File đã được xóa thành công' };
  }
}
