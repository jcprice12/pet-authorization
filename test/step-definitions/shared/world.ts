import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';

export class World {
  public app: INestApplication;
  public server: any;
  public superTest: supertest.Test;
  public superAgentTests: Map<string, supertest.SuperAgentTest>;
  private static instance: World;

  private constructor() {
    this.superAgentTests = new Map<string, supertest.SuperAgentTest>();
  }

  static getInstance() {
    if (!World.instance) {
      World.instance = new World();
    }
    return World.instance;
  }

  static reset() {
    World.instance = null;
  }

  useSuperAgentTest(key: string): supertest.SuperAgentTest {
    const superAgentTest =
      World.instance.superAgentTests.get(key) ?? supertest.agent(World.instance.server);
    World.instance.superAgentTests.set(key, superAgentTest);
    return superAgentTest;
  }
}
