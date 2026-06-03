import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import {
  CreateUserDto,
  QueryUsersDto,
  UpdateRoleDto,
  UpdateUserDto,
} from './dto/user.dto';

export interface PaginatedUsers {
  data: Omit<User, 'password'>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  // Helpers
  private strip(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return safe as any;
  }

  private async assertNotDuplicate(
    email: string,
    username: string,
    mssv?: string | null,
    excludeId?: number,
  ): Promise<void> {
    const whereConditions: any[] = [{ email }, { username }];
    if (mssv) whereConditions.push({ mssv });

    const existing = await this.repo.findOne({
      where: whereConditions,
    });
    if (existing && existing.id !== excludeId) {
      let field = 'Thông tin';
      if (existing.email === email) field = 'Email';
      else if (existing.username === username) field = 'Username';
      else if (mssv && existing.mssv === mssv) field = 'MSSV';
      throw new ConflictException(`${field} đã tồn tại`);
    }
  }

  // Create
  async createUser(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    await this.assertNotDuplicate(dto.email, dto.username, dto.mssv);
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      ...dto,
      password: hashed,
      role: dto.role ?? 'STUDENT',
    });
    const saved = await this.repo.save(user);
    return this.strip(saved);
  }

  // Read
  async findAll(query: QueryUsersDto): Promise<PaginatedUsers> {
    const { search, role, page = 1, limit = 20 } = query;

    const where: Record<string, unknown>[] = [];

    if (search) {
      const pattern = `%${search}%`;
      if (role) {
        where.push({ username: ILike(pattern), role });
        where.push({ email: ILike(pattern), role });
      } else {
        where.push({ username: ILike(pattern) });
        where.push({ email: ILike(pattern) });
      }
    } else if (role) {
      where.push({ role });
    }

    const [data, total] = await this.repo.findAndCount({
      where: where.length ? where : undefined,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map((user) => this.strip(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy user id=${id}`);
    return this.strip(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'isActive'], // include what you need
    });
  }

  async setResetToken(id: number, token: string, expires: Date): Promise<void> {
    await this.repo.update(id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.repo.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async updatePasswordAndClearToken(
    id: number,
    newPasswordHashed: string,
  ): Promise<void> {
    await this.repo.update(id, {
      password: newPasswordHashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  // Update
  async updateUser(
    id: number,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy user id=${id}`);

    if (dto.email || dto.username || dto.mssv) {
      await this.assertNotDuplicate(
        dto.email ?? user.email,
        dto.username ?? user.username,
        dto.mssv ?? user.mssv,
        id,
      );
    }

    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    return this.strip(saved);
  }

  async updateRole(
    id: number,
    dto: UpdateRoleDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy user id=${id}`);
    user.role = dto.role;
    const saved = await this.repo.save(user);
    return this.strip(saved);
  }

  // Soft-disable / hard-delete
  async setActive(
    id: number,
    isActive: boolean,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy user id=${id}`);
    user.isActive = isActive;
    const saved = await this.repo.save(user);
    return this.strip(saved);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy user id=${id}`);
    await this.repo.remove(user);
  }

  // Auth helper
  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }
}
