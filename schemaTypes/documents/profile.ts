import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

export const profile = defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      description: 'One-liner under the name on the Standard View hero.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'resume',
      title: 'Resume',
      type: 'object',
      fields: [
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'array',
          of: [defineArrayMember({type: 'block'})],
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
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'philosophy',
      title: 'Philosophy',
      description: 'One-line working philosophy (e.g. clean code).',
      type: 'text',
    }),
    defineField({
      name: 'experiences',
      title: 'Experience',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'experience'}]})],
    }),
    defineField({
      name: 'stack',
      title: 'Tech Stack',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'stackItem',
          title: 'Stack Item',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {
                list: [
                  {title: 'Framework', value: 'framework'},
                  {title: 'Language', value: 'language'},
                  {title: 'Tool', value: 'tool'},
                  {title: 'Cloud', value: 'cloud'},
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'service',
          title: 'Service',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'contact',
      title: 'Contact',
      type: 'object',
      fields: [
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (rule) => rule.email().required(),
        }),
        defineField({
          name: 'blurb',
          title: 'Blurb',
          description: 'One-line text shown in the contact section/modal.',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'linkedin',
          title: 'LinkedIn URL',
          type: 'url',
        }),
        defineField({
          name: 'github',
          title: 'GitHub URL',
          type: 'url',
        }),
      ],
    }),
    defineField({
      name: 'siteConfig',
      title: 'Site Config',
      description:
        'Global copy: brand, headings, CTAs, nav items. Leave empty to use the built-in defaults.',
      type: 'object',
      fields: [
        defineField({name: 'brand', title: 'Brand', type: 'string'}),
        defineField({name: 'splashLine', title: 'Splash Line', type: 'string'}),
        defineField({name: 'heroTagline', title: 'Hero Tagline', type: 'text', rows: 3}),
        defineField({name: 'metaTitle', title: 'Meta Title', type: 'string'}),
        defineField({name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2}),
        defineField({
          name: 'headings',
          title: 'Section Headings',
          type: 'object',
          fields: [
            defineField({name: 'about', title: 'About', type: 'string'}),
            defineField({name: 'stack', title: 'Stack', type: 'string'}),
            defineField({name: 'showcase', title: 'Showcase', type: 'string'}),
            defineField({name: 'contact', title: 'Contact', type: 'string'}),
            defineField({name: 'resume', title: 'Resume', type: 'string'}),
            defineField({name: 'projects', title: 'Projects', type: 'string'}),
            defineField({name: 'journal', title: 'Journal', type: 'string'}),
            defineField({name: 'experience', title: 'Experience', type: 'string'}),
          ],
        }),
        defineField({
          name: 'ctas',
          title: 'CTA Labels',
          type: 'object',
          fields: [
            defineField({name: 'caseStudy', title: 'Read a Case Study', type: 'string'}),
            defineField({name: 'resume', title: 'View Resume', type: 'string'}),
            defineField({name: 'readCaseStudy', title: 'Read Case Study (card)', type: 'string'}),
            defineField({name: 'email', title: 'Email Me', type: 'string'}),
          ],
        }),
        defineField({
          name: 'categoryLabels',
          title: 'Stack Category Labels',
          type: 'object',
          fields: [
            defineField({name: 'framework', title: 'Framework', type: 'string'}),
            defineField({name: 'language', title: 'Language', type: 'string'}),
            defineField({name: 'tool', title: 'Tool', type: 'string'}),
            defineField({name: 'cloud', title: 'Cloud', type: 'string'}),
          ],
        }),
        defineField({
          name: 'navItems',
          title: 'Navigation Items',
          description: 'HUD buttons. id must match a content id or slug.',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'navItem',
              title: 'Nav Item',
              type: 'object',
              fields: [
                defineField({
                  name: 'id',
                  title: 'ID',
                  description: 'Content id or slug (e.g. "showcase", "jrn-japanese").',
                  type: 'string',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  validation: (rule) => rule.required(),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name'},
  },
})
