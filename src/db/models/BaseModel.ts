import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

class BaseModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ default: false })
  public deleted: boolean;
}

export { BaseModel };
