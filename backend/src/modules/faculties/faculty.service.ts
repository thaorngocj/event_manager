import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './faculty.entity';
import { CreateFacultyDto, UpdateFacultyDto } from './dto/faculty.dto';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
  ) {}

  async create(createDto: CreateFacultyDto): Promise<Faculty> {
    const existing = await this.facultyRepository.findOne({ where: { code: createDto.code } });
    if (existing) {
      throw new ConflictException('Faculty code already exists');
    }
    const faculty = this.facultyRepository.create(createDto);
    return await this.facultyRepository.save(faculty);
  }

  async findAll(): Promise<Faculty[]> {
    return await this.facultyRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({ where: { id } });
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${id} not found`);
    }
    return faculty;
  }

  async update(id: number, updateDto: UpdateFacultyDto): Promise<Faculty> {
    const faculty = await this.findOne(id);
    if (updateDto.code && updateDto.code !== faculty.code) {
      const existing = await this.facultyRepository.findOne({ where: { code: updateDto.code } });
      if (existing) {
        throw new ConflictException('Faculty code already exists');
      }
    }
    Object.assign(faculty, updateDto);
    return await this.facultyRepository.save(faculty);
  }

  async remove(id: number): Promise<void> {
    const faculty = await this.findOne(id);
    await this.facultyRepository.remove(faculty);
  }
}
