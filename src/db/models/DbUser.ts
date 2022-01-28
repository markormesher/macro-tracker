import { BaseEntity, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { IUser } from "../../models/IUser";

@Entity()
class DbUser extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ default: false })
  public deleted: boolean;

  @Column()
  public displayName: string;

  @Column()
  public externalUsername: string;
}

export { DbUser };
