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
import { V1Pod } from '@kubernetes/client-node'
import { Pod } from './models'
import { getAllNamespacedPods, getNamespacedPods, getNamespacedPod } from './methods'
import { loadFixture } from '../utils/testUtils'
/* eslint-disable @typescript-eslint/camelcase*/
import { Client1_13, ApiRoot } from 'kubernetes-client';

const POD_FIXTURE = loadFixture('Pods', 'podResponseFixture.json');
const POD_LIST_FIXTURE = loadFixture('Pods', 'podListResponseFixture.json');
jest.mock('kubernetes-client')

const setUpPodMethod = (podMethodOverride?: Object) => {
    const mockedPodMethods = {

        pods: {
            get: jest.fn().mockReturnValueOnce(POD_LIST_FIXTURE)
        },
        ...podMethodOverride
    }

    Client1_13.prototype.api =
    {
        v1: {
            namespaces: jest.fn(() =>
                mockedPodMethods
            ),
            pods: {
                get: jest.fn().mockReturnValueOnce(POD_LIST_FIXTURE)
            }
        }
    }
};

describe('tests pod model', () => {
    const client: ApiRoot = new Client1_13({});;
    describe('pod getting methods', () => {
        it('gets pods from all namespaces', async () => {

            setUpPodMethod();
            const podsRaw: V1Pod[] = POD_LIST_FIXTURE.body.items;
            const expectedResult: Pod[] = Pod.buildFromV1PodJSONArray(podsRaw);
            const actualResult: Pod[] = await getAllNamespacedPods(client);
            expect(JSON.stringify(actualResult)).toEqual(JSON.stringify(expectedResult));
        })
        it('gets pods for a namespace', async () => {
            setUpPodMethod();
            const podsRaw: V1Pod[] = POD_LIST_FIXTURE.body.items;
            const expectedResult: Pod[] = Pod.buildFromV1PodJSONArray(podsRaw);
            const actualResult: Pod[] = await getNamespacedPods(client, { namespace: 'default' });
            expect(JSON.stringify(actualResult)).toEqual(JSON.stringify(expectedResult));
        });
        it('gets pod from name and namespace', async () => {

            setUpPodMethod({
                pods: jest.fn(() => ({
                    get: jest.fn().mockReturnValueOnce(POD_FIXTURE)
                })),
            });
            const podRaw: V1Pod = POD_FIXTURE.body;
            const expectedResult: Pod = Pod.buildFromV1PodJSON(podRaw);
            const actualResult: Pod = await getNamespacedPod(client, { namespace: 'default', name: 'dummy' });
            expect(actualResult.spec).toEqual(expectedResult.spec);
            expect(actualResult.status).toEqual(expectedResult.status);
            expect(actualResult.metadata).toEqual(expectedResult.metadata);
            expect(true).toBeTruthy();
        });

    });

})
