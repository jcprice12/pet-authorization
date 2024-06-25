import { INestApplication } from '@nestjs/common';
import { Test, agent } from 'supertest';
import TestAgent from 'supertest/lib/agent';

export class World {
  public app: INestApplication;
  public server: any;
  public superTest: Test;
  public superTestAgents: Map<string, TestAgent>;
  private static instance: World;

  private constructor() {
    this.superTestAgents = new Map<string, TestAgent>();
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

  useSuperTestAgent(key: string): TestAgent {
    const superTestAgent = World.instance.superTestAgents.get(key) ?? agent(World.instance.server);
    World.instance.superTestAgents.set(key, superTestAgent);
    return superTestAgent;
  }
}
