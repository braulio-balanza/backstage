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
import { decodeDeploymentSpec, V1DeploymentSpecGuard, V1DeploymentStatusGuard, decodeDeploymentStatus } from './typeGuards'
import { V1Deployment, V1DeploymentSpec, V1DeploymentStatus } from '@kubernetes/client-node'
const { body: DEPLOYMENT }: { body: V1Deployment } = loadFixture('Deployments', 'deploymentResponseFixture.json');

describe('tests typeguards for Deployment', () => {
    const spec = DEPLOYMENT.spec;
    const status = DEPLOYMENT.status;
    describe('tests guards for V1DeploymentSpec', () => {
        it('returns whether object is spec', () => {
            expect(V1DeploymentSpecGuard.is(spec)).toEqual(true);
            expect(V1DeploymentSpecGuard.is(status)).toEqual(false)
        })
        it('decodes a V1DeploymentSpec from JSON', () => {
            expect(decodeDeploymentSpec(spec)).toBeInstanceOf(V1DeploymentSpec)
        })
        it('throws error if not a V1DeploymentSpec', () => {
            expect(() => decodeDeploymentSpec(status)).toThrowError()
        })
    })
    describe('test guards for V1DeploymentStatus', () => {
        it('returns whether object is status', () => {
            expect(V1DeploymentStatusGuard.is(status)).toEqual(true);
            expect(V1DeploymentStatusGuard.is(spec)).toEqual(false);
        })
        it('decodes a V1DeploymentStatus from JSON', () => {
            expect(decodeDeploymentStatus(status)).toBeInstanceOf(V1DeploymentStatus);
        })
        it('throws error if not a V1DeploymentStatus', () => {
            expect(() => decodeDeploymentStatus(spec)).toThrowError()
        })
    })
})
