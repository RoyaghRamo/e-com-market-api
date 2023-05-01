import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../../../../entities/order.entity';
import { FindManyOptions, Repository } from 'typeorm';
import {
  CreateOrderDto,
  UpdateOrderDto,
} from '../../../../common/dto/order.dto';
import {
  DeleteResult,
  PaginationParams,
  SaveResult,
  UpdateResult,
} from '../../../../common/interfaces/repo.response';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
  ) {}

  async getOrders(
    paginationParams?: PaginationParams<OrderEntity>,
  ): Promise<OrderEntity[]> {
    const page = paginationParams.page ? paginationParams.page : 1;
    const take = paginationParams.limit ? paginationParams.limit : 10;
    const skip = (page - 1) * take;

    const findOptions: FindManyOptions<OrderEntity> = {
      take,
      skip,
      where: paginationParams.filterFields,
      order: paginationParams.sortFields,
    };

    return await this.ordersRepository.find(findOptions);
  }

  async exists(filter: Partial<OrderEntity>) {
    const foundOrders = await this.getOrderByFilter(filter);
    return !(!foundOrders || foundOrders.length == 0);
  }

  async getOrderByFilter(filter: Partial<OrderEntity>) {
    return await this.ordersRepository.findBy(filter);
  }

  async getOrder(userId: number, id: number): Promise<OrderEntity> {
    return await this.ordersRepository.findOne({ where: { id, userId } });
  }

  async getOrderById(id: number): Promise<OrderEntity> {
    return await this.ordersRepository.findOne({ where: { id } });
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<SaveResult> {
    const order = this.ordersRepository.create(createOrderDto);
    const { id } = await this.ordersRepository.save(order);

    return { lastInsertedId: id };
  }

  async updateOrder(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<UpdateResult> {
    const { affected } = await this.ordersRepository.update(id, updateOrderDto);

    return { affected };
  }

  async deleteOrder(id: number): Promise<DeleteResult> {
    const { affected } = await this.ordersRepository.delete(id);

    return { affected };
  }
}
