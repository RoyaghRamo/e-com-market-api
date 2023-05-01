import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '../../../../common/base-components/base.controller';
import { CategoryEntity } from '../../../../entities/category.entity';
import { CategoriesService } from '../services/categories.service';
import {
  CustomHttpResponse,
  FetchResponse,
} from '../../../../common/interfaces/http.response';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../../../common/dto/category.dto';
import {
  DeleteResult,
  SaveResult,
  UpdateResult,
} from '../../../../common/interfaces/repo.responses';
import {
  IsOwnerGuard,
  JwtGuard,
  RolesGuard,
} from '../../../../common/guards/auth.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../../common/enums/auth.enum';
import { getMetadataArgsStorage } from 'typeorm';
import { prepareFilterAndSortField } from '../../../../common/helpers/general';

@Roles(Role.USER)
@UseGuards(JwtGuard, RolesGuard)
@Controller('category')
export class CategoriesController extends BaseController<CategoryEntity> {
  private readonly categorySortingFields: string[] = [];
  private readonly categoryFilteringFields: string[] = [];

  constructor(private readonly categoriesService: CategoriesService) {
    super();
    const propertyNames = getMetadataArgsStorage().columns.map((column) => {
      if (
        column.target === CategoryEntity &&
        column.propertyName !== undefined
      ) {
        return column.propertyName;
      }
    });
    this.categoryFilteringFields = propertyNames.filter(
      (name) => name !== undefined,
    );
  }

  @Get()
  async getAds(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('filter') filter: string,
    @Query('sort') sort: string,
  ) {
    this.fetchResponse = new FetchResponse<CategoryEntity>();

    try {
      const { filterFields, sortFields } =
        prepareFilterAndSortField<CategoryEntity>(
          this.categoryFilteringFields,
          this.categorySortingFields,
          filter,
          sort,
        );

      const categories = await this.categoriesService.getCategories({
        page,
        limit,
        filterFields,
        sortFields,
      });
      this.fetchResponse.success = true;
      this.fetchResponse.docs = categories;
      return this.fetchResponse;
    } catch (e) {
      this.fetchResponse.errors.push(e);
      throw new BadRequestException(this.fetchResponse);
    }
  }

  @Get(':id')
  async getCategory(
    @Param('id') id: number,
    // @Request() req,
  ): Promise<FetchResponse<CategoryEntity>> {
    this.fetchResponse = new FetchResponse<CategoryEntity>();

    try {
      const category = await this.categoriesService.getCategoryById(id);
      if (!category) {
        this.fetchResponse.errors.push('Forbidden Resource');
        throw new ForbiddenException(this.fetchResponse);
      }

      this.fetchResponse.success = true;
      this.fetchResponse.docs = [category];
      return this.fetchResponse;
    } catch (e) {
      this.fetchResponse.errors.push(e);
      throw new BadRequestException(this.fetchResponse);
    }
  }

  @Post()
  async createCategory(
    @Request() req,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    this.response = new CustomHttpResponse();

    const userId = req.user.userId;
    if (userId != createCategoryDto.userId) {
      this.response.errors.push('Forbidden Resource');
      throw new ForbiddenException(this.response);
    }

    let saveResult: SaveResult;
    try {
      saveResult = await this.categoriesService.createCategory(
        createCategoryDto,
      );
      this.response.success = true;
      return { ...this.response, ...saveResult };
    } catch (e) {
      this.response.errors.push(e);
      throw new BadRequestException(this.response);
    }
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard, IsOwnerGuard)
  async updateCategory(
    @Request() req,
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    this.response = new CustomHttpResponse();

    const userId = req.user.userId;
    const categoryExists = await this.categoriesService.exists({ id, userId });
    if (!categoryExists) {
      throw new ForbiddenException('Forbidden Resource');
    }

    let updateResult: UpdateResult;
    try {
      updateResult = await this.categoriesService.updateCategory(
        id,
        updateCategoryDto,
      );
      this.response.success = true;
      return { ...this.response, ...updateResult };
    } catch (e) {
      this.response.errors.push(e);
      throw new BadRequestException(this.response);
    }
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard, IsOwnerGuard)
  async deleteCategory(@Param('id') id: number, @Request() req) {
    this.response = new CustomHttpResponse();

    const userId = req.user.userId;
    const adExists = await this.categoriesService.exists({ id, userId });
    if (!adExists) {
      throw new ForbiddenException('Forbidden Resource');
    }

    let deleteResult: DeleteResult;
    try {
      deleteResult = await this.categoriesService.deleteCategory(id);
      this.response.success = true;
      return { ...this.response, ...deleteResult };
    } catch (e) {
      this.response.errors.push(e);
      throw new BadRequestException(this.response);
    }
  }
}
