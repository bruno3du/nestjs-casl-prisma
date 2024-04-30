import { SetMetadata } from "@nestjs/common";

export const USER_KEY = "user_key";

export const FakeUser = (user: { userId: string; profileId: string }): any =>
    SetMetadata(USER_KEY, user);
