import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import type { Response } from 'express';
import { User } from './user.entity';
import { Faculty } from '../faculties/faculty.entity';
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
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
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

  // Import / Export
  getImportTemplate(res: Response) {
    const wsData = [
      ['Username', 'Email', 'Password', 'MSSV', 'Role', 'Mã Khoa', 'Ngành', 'Khóa', 'Lớp', 'Chức vụ', 'Điểm rèn luyện'],
      ['nguyenvana', 'nguyenvana@gmail.com', '123456', 'SV001', 'STUDENT', 'IT', 'Kỹ thuật phần mềm', 'K28', 'SE1605', 'Bí thư', 0],
      ['tranvanb', 'tranvanb@gmail.com', '123456', 'SV002', 'STUDENT', 'PRC', 'Truyền thông', 'K28', 'PR1601', 'Lớp trưởng', 0],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Users');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Template_Import_Users.xlsx"',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    return res.send(buffer);
  }

  async importUsers(fileBuffer: Buffer) {
    let data: any[] = [];
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(sheet);
    } catch {
      throw new BadRequestException('File Excel không đúng định dạng');
    }

    if (data.length === 0) {
      throw new BadRequestException('File không có dữ liệu');
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const username = String(row.Username || row.username || '').trim();
      const email = String(row.Email || row.email || '').trim();
      let mssv = row.MSSV || row.mssv;
      if (mssv !== undefined && mssv !== null) mssv = String(mssv).trim();
      
      let password = String(row.Password || row.password || '').trim();
      
      let role = String(row.Role || row.role || 'STUDENT').trim().toUpperCase();
      if (!['STUDENT', 'EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
        role = 'STUDENT';
      }

      const facultyCode = String(row['Mã Khoa'] || '').trim();
      const major = String(row['Ngành'] || '').trim();
      const cohort = String(row['Khóa'] || '').trim();
      const classId = String(row['Lớp'] || '').trim();
      const unionRole = String(row['Chức vụ'] || '').trim();
      const trainingPoints = parseInt(row['Điểm rèn luyện']) || 0;

      if (!email || !username) {
        failedCount++;
        errors.push(`Dòng ${i + 2}: Thiếu email hoặc username`);
        continue;
      }

      // Check duplicates
      const existing = await this.repo.findOne({
        where: [{ email }, { username }, ...(mssv ? [{ mssv }] : [])],
      });

      if (existing) {
        failedCount++;
        let field = 'Thông tin';
        if (existing.email === email) field = 'Email';
        else if (existing.username === username) field = 'Username';
        else if (existing.mssv === mssv) field = 'MSSV';
        errors.push(`Dòng ${i + 2}: ${field} đã tồn tại`);
        continue;
      }

      // Password logic: Default to "VA" + mssv if empty
      if (!password) {
        if (mssv) {
          password = `VA${mssv}`;
        } else {
          failedCount++;
          errors.push(`Dòng ${i + 2}: Bỏ trống Password nhưng lại không có MSSV để tạo mặc định`);
          continue;
        }
      }

      let facultyId: number | undefined = undefined;
      if (facultyCode) {
        const faculty = await this.facultyRepo.findOne({ where: { code: facultyCode } });
        if (faculty) {
          facultyId = faculty.id;
        } else {
          // Ghi nhận lỗi hoặc bỏ qua, ở đây tạm thời gán null/undefined nếu không tìm thấy Khoa
          errors.push(`Dòng ${i + 2}: Mã Khoa '${facultyCode}' không tồn tại. User vẫn được tạo nhưng không có Khoa.`);
        }
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = this.repo.create({
        username,
        email,
        password: hashed,
        mssv: mssv || undefined,
        role: role as any,
        facultyId,
        major: major || undefined,
        cohort: cohort || undefined,
        classId: classId || undefined,
        unionRole: unionRole || undefined,
        trainingPoints,
      });

      const savedUser = await this.repo.save(user);
      successCount++;
    }

    return {
      message: `Import hoàn tất: ${successCount} thành công, ${failedCount} thất bại`,
      successCount,
      failedCount,
      errors: errors.slice(0, 50), // Trả về tối đa 50 lỗi đầu tiên tránh quá tải payload
    };
  }
}
