interface IUser {
  readonly id: string;
  readonly externalUsername: string;
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

export { IUser, mapUserFromApi };
