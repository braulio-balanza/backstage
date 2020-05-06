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
import fse from 'fs-extra';
import path from 'path';

export const wait = async (ms: number = 0): Promise<void> => new Promise(r => setTimeout(r, ms));
export const loadFixture = (apiSubDirectory: string, fixture: string) => {
    return JSON.parse(
        fse.readFileSync(
            path.join(__dirname, apiSubDirectory, '__fixtures__', fixture)
        ).toString('utf-8')
    );
}