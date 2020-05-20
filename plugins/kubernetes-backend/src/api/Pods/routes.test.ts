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

import express, { Application } from "express";
import expressPromiseRouter from "express-promise-router";
import { KubeConfig } from '@kubernetes/client-node'
import bodyParser from 'body-parser';
import request from 'supertest';
import { bindRoutes } from "./routes";
import { loadFixture } from '../utils/testUtils'
import { Pod } from "./models";

jest.mock('./methods');

const methods = require.requireMock('./methods');
const dummyKubeConfig = new KubeConfig();
const { body: { items: POD_LIST_FIXTURE } } = loadFixture('Pods', 'podListResponseFixture.json');
const { body: POD_FIXTURE } = loadFixture('Pods', 'podResponseFixture.json');

describe('pod routes', () => {
    let app: Application;

    beforeEach(async () => {
        KubeConfig.prototype.loadFromDefault = jest.fn().mockReturnValueOnce(
            new KubeConfig()
        );
        app = express();
        app.use(bodyParser.json());
        const router = expressPromiseRouter();
        bindRoutes(router);
        app.use(router);
    });

    describe("GET /v1/getAllNamespacedPods", () => {
        beforeEach(() => {
            methods.getAllNamespacedPods.mockResolvedValueOnce(
                Pod.buildFromV1PodArray(POD_LIST_FIXTURE)
            )
        });
        afterEach(() => {
            methods.getAllNamespacedPods.mockReset();
        });
        it('returns the correct payload', async () => {
            await request(app)
                .get('/v1/getAllNamespacedPods')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(res => {
                    expect(methods.getAllNamespacedPods).toHaveBeenCalledWith(dummyKubeConfig);
                    expect(res.body).toBeInstanceOf(Array);
                    expect(res.body.length).toBe(10);
                    res.body.forEach((element: any) => {
                        expect(element).toBeInstanceOf(Object);
                    });
                })
        });
    });
    describe('GET /v1/getNamespacedPods', () => {
        beforeEach(() => {
            methods.getNamespacedPods.mockResolvedValueOnce(
                Pod.buildFromV1PodArray(POD_LIST_FIXTURE)
            );
        });
        afterEach(() => {
            methods.getNamespacedPods.mockReset();
        });

        it("returns the correct payload", async () => {
            await request(app)
                .get('/v1/getNamespacedPods/{"namespace":"default"}')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(res => {
                    expect(methods.getNamespacedPods).toHaveBeenCalledWith(dummyKubeConfig, { namespace: 'default' })
                    expect(res.body).toBeInstanceOf(Array);
                    expect(res.body.length).toBe(10);
                    res.body.forEach((element: any) => {
                        expect(element).toBeInstanceOf(Object);
                    });

                });
        });
    });
    describe('GET /v1/getNamespacedPodFromName', () => {
        beforeEach(() => {
            methods.getNamespacedPod.mockResolvedValueOnce(
                Pod.buildFromV1PodJSON(POD_FIXTURE)
            );
        });
        afterEach(() => {
            methods.getNamespacedPod.mockReset();
        });
        it('returns the correct payload', async () => {
            await request(app)
                .get('/v1/getNamespacedPod/{"name":"hello-node-57c6f5dbf6-v2txn","namespace":"default"}')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(res => {
                    expect(methods.getNamespacedPod).toHaveBeenCalledWith(
                        dummyKubeConfig, {
                        name: 'hello-node-57c6f5dbf6-v2txn',
                        namespace: 'default'
                    })
                    expect(res.body).toBeInstanceOf(Object);
                    expect(res.body.name).toBe("hello-node-57c6f5dbf6-v2txn")
                });
        });
    });
})