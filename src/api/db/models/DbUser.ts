import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IUser } from "../../../commons/models/IUser";

@Entity()
class DbUser extends BaseEntity implements IUser {

	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ default: false })
	public deleted: boolean;

	@Column()
	public googleId: string;

	@Column()
	public displayName: string;

}

export {
	DbUser,
};
