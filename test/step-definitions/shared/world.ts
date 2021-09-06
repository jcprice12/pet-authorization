import { INestApplication } from '@nestjs/common';
import { Test } from 'supertest';

export class World {
  public app: INestApplication;
  public request: Test;

  private static instance: World;

  private constructor() {}

  static getInstance() {
    if (!World.instance) {
      World.instance = new World();
    }
    return World.instance;
  }
}
