import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import PageBreadcrumb from 'app/shared-components/PageBreadcrumb';
import GuideListMenu from './GuideListMenu';
import { useGetHelpCenterGuideCategoriesQuery, useGetHelpCenterGuidesByCategoryQuery } from '../HelpCenterApi';
import _ from '../../../../../@lodash/@lodash';

/**
 * The guide category.
 */
function GuideCategory() {
	const routeParams = useParams();
	const { categorySlug } = routeParams;

	const { data: categories } = useGetHelpCenterGuideCategoriesQuery();
	const category = useMemo(() => _.find(categories, { slug: categorySlug }), [categories, categorySlug]);

	const { data: guides } = useGetHelpCenterGuidesByCategoryQuery({
		categorySlug
	});

	return (
		<div className="flex flex-col items-center p-24 sm:p-40 container">
			<div className="flex flex-col w-full max-w-4xl">
				<div className="sm:mt-32">
					<PageBreadcrumb />
				</div>
				<div className="mt-8 text-4xl sm:text-7xl font-extrabold tracking-tight leading-tight">
					{category?.title}
				</div>
				<div className="mt-32 sm:mt-48">
					<GuideListMenu list={guides} />
				</div>
			</div>
		</div>
	);
}

export default GuideCategory;
