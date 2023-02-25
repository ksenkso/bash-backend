import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ type: 'tsvector', default: "to_tsvector('')" })
  indexedText: any;

  @Column()
  rating: number;

  @Column()
  date: Date;
}
