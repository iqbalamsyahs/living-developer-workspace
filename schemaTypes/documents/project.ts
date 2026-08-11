import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const projectCaseStudy = defineType({
  name: 'projectCaseStudy',
  title: 'Project Case Study',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      description: 'Display year or month, e.g. "2025".',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'Stable id used by the frontend (e.g. "cs-pensioner-admin").',
      type: 'slug',
      options: {source: 'title'},
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      description: 'One-to-two-line teaser shown on cards.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'link',
          title: 'Link',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
