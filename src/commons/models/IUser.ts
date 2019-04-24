interface IUser {
	readonly id: string;
	readonly googleId: string;
	readonly displayName: string;
	readonly deleted: boolean;
}

function mapUserFromApi(user?: IUser): IUser {
	if (!user) {
		return undefined;
	}

	return {
		...user,
	};
}

export {
	IUser,
	mapUserFromApi,
};
