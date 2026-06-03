import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedEventsData1780000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "events" 
      ("title", "description", "location", "startDate", "endDate", "registrationDeadline", "status", "displayCategory", "eventCategory", "scale", "maxParticipants", "registeredCount", "imageUrl") 
      VALUES
      ('Hội thảo Lập trình AI', 'Một hội thảo thú vị về cách xây dựng trợ lý AI hiện đại.', 'Hội trường A', '2026-06-15 08:00:00', '2026-06-15 12:00:00', '2026-06-14 23:59:59', 'OPEN', 'HERO', 'ACADEMIC', 'SCHOOL', 200, 10, 'https://images.unsplash.com/photo-1540575861501-7ad060e39fe5?auto=format&fit=crop&q=80&w=2000'),
      ('Sự kiện hết hạn (20/5)', 'Sự kiện này đã kết thúc hạn đăng ký vào ngày 20/5.', 'Hội trường B', '2026-05-20 08:00:00', '2026-05-20 12:00:00', NULL, 'OPEN', 'FEATURED', 'ACADEMIC', 'SCHOOL', 100, 50, 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000'),
      ('Cuộc thi Thể thao', 'Cuộc thi giao lưu thể thao toàn trường.', 'Sân bóng đá', '2026-07-01 07:00:00', '2026-07-01 17:00:00', '2026-06-25 23:59:59', 'UPCOMING', 'HIGHLIGHT', 'SPORT', 'SCHOOL', 50, 0, 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2000'),
      ('Buổi hòa nhạc Âm nhạc', 'Trình diễn nhạc kịch sinh viên.', 'Nhà hát', '2026-06-20 19:00:00', '2026-06-20 22:00:00', '2026-06-19 23:59:59', 'OPEN', 'FEATURED', 'CULTURE', 'SCHOOL', 500, 480, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800'),
      ('Talkshow Khởi nghiệp', 'Lắng nghe kinh nghiệm từ các founder thành công.', 'Hội trường C', '2026-06-10 14:00:00', '2026-06-10 17:00:00', '2026-06-09 23:59:59', 'OPEN', 'FEATURED', 'ACADEMIC', 'SCHOOL', 300, 150, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "events" WHERE "title" IN ('Hội thảo Lập trình AI', 'Sự kiện hết hạn (20/5)', 'Cuộc thi Thể thao', 'Buổi hòa nhạc Âm nhạc', 'Talkshow Khởi nghiệp')
    `);
  }
}
