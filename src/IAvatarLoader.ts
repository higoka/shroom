import { AvatarDrawDefinition } from "./objects/avatar/util/getAvatarDrawDefinition";

export interface IAvatarLoader {
  getAvatarDrawDefinition(look: string): Promise<AvatarLoaderResult>;
}

export type AvatarLoaderResult = {
  getDrawDefinition(
    look: string,
    direction: number,
    action: string,
    frame: number
  ): AvatarDrawDefinition;
  getTexture: (id: string) => PIXI.Texture;
};