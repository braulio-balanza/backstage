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
import { loadFixture } from '../utils/testUtils'
import { V1Deployment } from '@kubernetes/client-node'
import { DeploymentGuard } from './typeGuards'
import { Deployment } from './models'
const { body: DEPLOYMENT }: { body: V1Deployment } = loadFixture('Deployments', 'deploymentResponse.json')
const { body: { items: DEPLOYMENT_LIST } }: { body: { items: Array<V1Deployment> } } = loadFixture('Deployments', 'deploymentListResponse.json')

describe('tests Deployment model', () => {
    describe('tests methods for deployment model', () => {
        describe('tests build methods', () => {
            it('builds deployment from JSON', () => {
                expect(DeploymentGuard.is(Deployment.buildFromJSON(DEPLOYMENT))).toEqual(true)
            })
            it('builds deployment array from JSON list', () => {
                const deployments: Array<Deployment> = Deployment.buildFromJSONArray(DEPLOYMENT_LIST)
                deployments.forEach(deployment => expect(DeploymentGuard.is(deployment)).toEqual(true));
            })
        })
    })
})
