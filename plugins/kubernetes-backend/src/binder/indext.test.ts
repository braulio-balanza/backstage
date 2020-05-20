/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { bindRoutes } from './index';
import { KubeConfig } from '@kubernetes/client-node';
import express, { Router, Application } from "express";
import bodyParser from 'body-parser';

describe('Tests index', () => {
    let app: Application;
    const router: Router = Router();
    beforeAll(() => {
        app = express();
        app.use(bodyParser.json());
    })
    describe('On empty KubeConfig', () => {
        it('returns error on empty kubeconfig file', async () => {
            const configs: [KubeConfig, KubeConfig] = [new KubeConfig(), new KubeConfig()];
            configs[1].loadFromOptions({ clusters: [], users: [], contexts: [] });
            configs.forEach(async (config: KubeConfig) => {
                KubeConfig.prototype.loadFromDefault = jest.fn().mockReturnValueOnce(config);
                await expect(bindRoutes(router))
                    .rejects
                    .toThrowError('Kubernetes configuration file was empty!')
            });
        });
    });
});