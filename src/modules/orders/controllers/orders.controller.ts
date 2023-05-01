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
import { OrderEntity } from '../../../../entities/order.entity';
import { OrdersService } from '../services/orders.service';
import {
  CustomHttpResponse,
  FetchResponse,
} from '../../../../common/interfaces/http.response';
import {
  CreateOrderDto,
  UpdateOrderDto,
} from '../../../../common/dto/order.dto';
import {
  DeleteResult,
  SaveResult,
  UpdateResult,
} from '../../../../common/interfaces/repo.response';
import {
  IsOwnerGuard,
  JwtGuard,
  RolesGuard,
} from '../../../../common/guards/auth.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../../common/enums/auth.enum';
import { ProductsService } from '../../products/services/products.service';
import { getMetadataArgsStorage } from 'typeorm';
import { prepareFilterAndSortField } from '../../../../common/helpers/general';
import { CategoryEntity } from '../../../../entities/category.entity';

@Roles(Role.USER)
@UseGuards(JwtGuard, RolesGuard)
@Controller('order')
export class OrdersController extends BaseController<OrderEntity> {
  private readonly orderSortingFields: string[] = [];
  private readonly orderFilteringFields: string[] = [];

  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {
    super();
    const propertyNames = getMetadataArgsStorage().columns.map((column) => {
      if (column.target === OrderEntity && column.propertyName !== undefined) {
        return column.propertyName;
      }
    });
    this.orderFilteringFields = propertyNames.filter(
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
  ): Promise<FetchResponse<OrderEntity>> {
    this.fetchResponse = new FetchResponse<OrderEntity>();
    const userId = req.user.userId;

    try {
      const { filterFields, sortFields } =
        prepareFilterAndSortField<CategoryEntity>(
          this.orderFilteringFields,
          this.orderSortingFields,
          filter,
          sort,
        );

      filterFields.userId = userId;

      const orders = await this.ordersService.getOrders({
        page,
        limit,
        filterFields,
        sortFields,
      });
      const cartOrders = [];

      for (let i = 0; i < orders.length; i++) {
        const product = await this.productsService.getProductById(
          orders[i].productId,
        );
        cartOrders.push({
          ...orders[i],
          product,
        });
      }

      this.fetchResponse.success = true;
      this.fetchResponse.docs = cartOrders;
      return this.fetchResponse;
    } catch (e) {
      this.fetchResponse.errors.push(e);
      throw new BadRequestException(this.fetchResponse);
    }
  }

  @Get(':id')
  async getOrder(
    @Param('id') id: number,
    @Request() req,
  ): Promise<FetchResponse<OrderEntity>> {
    this.fetchResponse = new FetchResponse<OrderEntity>();

    const userId = req.user.userId;
    const orderExists = await this.ordersService.exists({ id, userId });
    if (!orderExists) {
      throw new ForbiddenException('Forbidden Resource');
    }

    let order: OrderEntity;
    try {
      order = await this.ordersService.getOrder(userId, id);
      const docs = [];
      const product = await this.productsService.getProductById(
        order.productId,
      );
      docs.push({
        product,
        ...order,
      });

      this.fetchResponse.success = true;
      this.fetchResponse.docs = docs;
      return this.fetchResponse;
    } catch (e) {
      this.fetchResponse.errors.push(e);
      throw new BadRequestException(this.fetchResponse);
    }
  }

  @Post()
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    this.response = new CustomHttpResponse();

    const userId = req.user.userId;
    if (userId != createOrderDto.userId) {
      this.response.errors.push('Forbidden Resource');
      throw new ForbiddenException(this.response);
    }

    // Check if the product quantity is enough before creating the order
    const product = await this.productsService.getProductById(
      createOrderDto.productId,
    );

    if (!product) {
      this.response.errors.push('Invalid ProductId!');
      throw new ForbiddenException(this.response);
    }

    if (product.quantity < createOrderDto.quantity) {
      this.response.errors.push('Insufficient product quantity!');
      throw new ForbiddenException(this.response);
    }

    let saveResult: SaveResult;
    try {
      saveResult = await this.ordersService.createOrder(createOrderDto);
      this.response.success = true;
      return { ...this.response, ...saveResult };
    } catch (e) {
      this.response.errors.push(e);
      throw new BadRequestException(this.response);
    }
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard, IsOwnerGuard)
  async updateOrder(
    @Request() req,
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    console.log('updateOrderDto', updateOrderDto);

    this.response = new CustomHttpResponse();

    const userId = req.user.userId;
    const orderExists = await this.ordersService.exists({ id, userId });
    if (!orderExists) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const order = await this.ordersService.getOrderById(id);

    if (updateOrderDto.quantity) {
      let productId = order.productId;

      if (updateOrderDto.productId) {
        productId = updateOrderDto.productId;
      }

      const product = await this.productsService.getProductById(productId);

      if (product.quantity < updateOrderDto.quantity) {
        this.response.errors.push('Insufficient product quantity!');
        throw new ForbiddenException(this.response);
      }
    }

    let updateResult: UpdateResult;
    try {
      updateResult = await this.ordersService.updateOrder(id, updateOrderDto);
      this.response.success = true;
      return { ...this.response, ...updateResult };
    } catch (e) {
      this.response.errors.push(e);
      throw new BadRequestException(this.response);
    }
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard, IsOwnerGuard)
  async deleteOrder(@Param('id') id: number, @Request() req) {
    this.response = new CustomHttpResponse();

    const userId = req.user.userId;
    const adExists = await this.ordersService.exists({ id, userId });
    if (!adExists) {
      throw new ForbiddenException('Forbidden Resource');
    }

    let deleteResult: DeleteResult;
    try {
      deleteResult = await this.ordersService.deleteOrder(id);
      this.response.success = true;
      return { ...this.response, ...deleteResult };
    } catch (e) {
      this.response.errors.push(e);
      throw new BadRequestException(this.response);
    }
  }
}
