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
import { loadFixture } from '../testUtils'
import { Pod } from './models'
import { V1Pod } from '@kubernetes/client-node'

const { body: v1Pod }: { body: V1Pod } = loadFixture('Pods', 'podResponseFixture.json');

describe(`tests model's methods work properly`, () => {
    it(" builds pod from V1Pod", () => {
        expect(Pod.buildFromV1Pod(v1Pod)).toBeInstanceOf(Pod);
    })
})