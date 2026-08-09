import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {structure} from './structure'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'studio-portofolio',
  title: 'Portofolio Studio',

  projectId: 'kioy6hgr',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
