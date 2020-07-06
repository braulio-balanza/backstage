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
import { KubeConfig } from '@kubernetes/client-node';
import bodyParser from 'body-parser';
import request from 'supertest';
/* eslint-disable @typescript-eslint/camelcase*/
import { Client1_13 } from 'kubernetes-client';
import { bindRoutes } from "./routes";
import { loadFixture } from '../utils/testUtils'
import { PodGuard } from './typeGuards'
import { Pod } from "./models";

jest.mock('./methods');
jest.mock('kubernetes-client')
const methods = require.requireMock('./methods');
const dummyClient = new Client1_13({});
const { body: { items: POD_LIST_FIXTURE } } = loadFixture('Pods', 'podListResponse.json');
const { body: POD } = loadFixture('Pods', 'podResponse.json');

describe('pod routes', () => {
    let app: Application;

    beforeEach(async () => {
        KubeConfig.prototype.loadFromDefault = jest.fn().mockReturnValueOnce(
            new KubeConfig()
        );
        app = express();
        app.use(bodyParser.json());
        const router = expressPromiseRouter();
        bindRoutes(router, dummyClient);
        app.use(router);
    });

    describe('On empty KubeConfig file', () => {

        describe("GET /v1/getAllNamespacedPods", () => {
            beforeEach(() => {
                methods.getAllNamespacedPods.mockResolvedValueOnce(
                    Pod.buildFromJSONArray(POD_LIST_FIXTURE)
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
                        expect(methods.getAllNamespacedPods).toHaveBeenCalledWith(dummyClient);
                        expect(res.body).toBeInstanceOf(Array);
                        expect(res.body.length).toEqual(10);
                        res.body.forEach((element: any) => {
                            expect(PodGuard.is(element)).toEqual(true);
                        });
                    })
            });
        });
        describe('GET /v1/getNamespacedPods', () => {
            beforeEach(() => {
                methods.getNamespacedPods.mockResolvedValueOnce(
                    Pod.buildFromJSONArray(POD_LIST_FIXTURE)
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
                        expect(methods.getNamespacedPods).toHaveBeenCalledWith(dummyClient, { namespace: 'default' })
                        expect(res.body).toBeInstanceOf(Array);
                        expect(res.body.length).toEqual(10);
                        res.body.forEach((element: any) => {
                            expect(PodGuard.is(element)).toEqual(true);
                        });

                    });
            });
        });
        describe('GET /v1/getNamespacedPodFromName', () => {
            beforeEach(() => {
                methods.getNamespacedPod.mockResolvedValueOnce(
                    Pod.buildFromJSON(POD)
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
                            dummyClient, {
                            name: 'hello-node-57c6f5dbf6-v2txn',
                            namespace: 'default'
                        })
                        expect(PodGuard.is(res.body)).toEqual(true);
                        expect(res.body.metadata?.name).toEqual("hello-node-57c6f5dbf6-v2txn")
                        expect(res.body.kind).toEqual('Pod')
                    });
            });
        });
    })
});