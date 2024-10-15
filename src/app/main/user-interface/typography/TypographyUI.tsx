import FuseHighlight from '@fuse/core/FuseHighlight';
import FusePageSimple from '@fuse/core/FusePageSimple';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'app/shared-components/PageBreadcrumb';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.palette.divider
	}
}));

/**
 * The typography page.
 */
function TypographyUI() {
	return (
		<Root
			header={
				<div className="flex flex-col sm:flex-row flex-0 sm:items-center sm:justify-between p-24 sm:py-32 sm:px-40">
					<div className="flex-1 min-w-0">
						<PageBreadcrumb className="mb-8" />
						<Typography className="text-4xl font-extrabold leading-none tracking-tight mb-4">
							Typography
						</Typography>
					</div>
					<div>
						<Button
							className="mt-12 sm:mt-0"
							variant="contained"
							color="secondary"
							component="a"
							href="https://mui.com/components/typography"
							target="_blank"
							role="button"
							startIcon={<FuseSvgIcon>heroicons-solid:arrow-top-right-on-square</FuseSvgIcon>}
						>
							Official docs
						</Button>
					</div>
				</div>
			}
			content={
				<div className="flex-auto p-24 sm:p-40 w-full space-y-48">
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography variant="h1">Display 4</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                           <Typography variant="h1">Display 4</Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography variant="h2">Display 3</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                           <Typography variant="h2">Display 3</Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography variant="h3">Display 2</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                           <Typography variant="h3">Display 2</Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography variant="h4">Display 1</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                           <Typography variant="h4">Display 1</Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography variant="h5">Headline</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                          <Typography variant="h5">Headline</Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography variant="h6">Title</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                           <Typography variant="h6">Title</Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography variant="subtitle1">Subheading</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                             <Typography variant="subtitle1">Subheading</Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography variant="body1">Body 2</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                            <Typography variant="body1">Body 2</Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography variant="body2">Body 1</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                            <Typography variant="body2">Body 1</Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography variant="caption">Caption</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                            <Typography variant="caption">Caption</Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography
								gutterBottom
								noWrap
							>
								Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
								incididunt ut labore et dolore magna aliqua.
							</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                           <Typography noWrap>
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                            </Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
					<div className="flex flex-wrap">
						<div className="flex w-full sm:w-1/2">
							<Typography variant="button">Button</Typography>
						</div>
						<div className="flex w-full sm:w-1/2">
							<FuseHighlight
								component="pre"
								className="language-html w-full"
							>
								{`
                                             <Typography variant="button">Button</Typography>
                                        `}
							</FuseHighlight>
						</div>
					</div>
				</div>
			}
		/>
	);
}

export default TypographyUI;
