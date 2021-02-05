import Head from 'next/head';
import {
	Card,
	CardBody,
	Badge,
	Divider,
	HStack,
	Surface,
	Menu,
	Heading,
	Spacer,
	Scrollable,
	MenuItem,
	SearchInput,
	Text,
	View,
	Avatar,
	VStack,
} from '@wp-g2/components';
import { ui } from '@wp-g2/styles';
import blockListData from '../data/blocks.json';
import patternsListData from '../data/patterns.json';
import Fuse from 'fuse.js';
import { v4 as uuid } from 'uuid';

const options = {
	includeScore: true,
	keys: ['title', 'description', 'name'],
};

const blocksAndPatterns = [
	...blockListData,
	...patternsListData,
].map((block) => ({ ...block, id: block.id || uuid() }));

const remappedBlocksAndPatterns = blocksAndPatterns.map(
	({ title, description, id, name }) => ({
		title,
		id,
		description,
		name,
	})
);
const fuse = new Fuse(remappedBlocksAndPatterns, options);

function SearchItem({ title = 'Title', onClick, id, isSelected }) {
	const handleOnClick = () => onClick(id);

	return (
		<MenuItem onClick={handleOnClick} aria-selected={isSelected}>
			<HStack spacing={3}>
				<View css={{ width: 24 }}>
					<Avatar name={title} size="small" />
				</View>
				<Spacer>
					<Text truncate weight={600}>
						{title}
					</Text>
				</Spacer>
			</HStack>
		</MenuItem>
	);
}

function SearchContent({
	title = 'Title',
	description = 'Description',
	content,
	children,
}) {
	const isBlock = !content;
	const badgeLabel = isBlock ? 'Block' : 'Pattern';

	return (
		<VStack spacing={4}>
			<VStack spacing={1}>
				<View>
					<Badge>{badgeLabel}</Badge>
				</View>

				<Heading size={4}>{title}</Heading>
				<Text size={11} variant="muted">
					{description}
				</Text>
			</VStack>
			{content && (
				<div
					style={{
						background: 'var(--global--color-background)',
						color: 'var(--global--color-primary)',
					}}
				>
					<div dangerouslySetInnerHTML={{ __html: content }} />
				</div>
			)}
			<View>{children}</View>
		</VStack>
	);
}

function SearchResultsView({
	items,
	selectedBlockId,
	setSelectedBlockId,
	searchQuery,
}) {
	const scrollNodeRef = React.useRef();

	React.useEffect(() => {
		scrollNodeRef.current.scrollTop = 0;
	}, [searchQuery]);

	return (
		<View css={{ width: '40%', maxWidth: 280, height: '100%' }}>
			<Scrollable
				css={{
					height: '100%',
					padding: ui.space(2),
				}}
				ref={scrollNodeRef}
			>
				<Menu>
					{items.map((result, index) => (
						<SearchItem
							key={index}
							{...result.item}
							onClick={setSelectedBlockId}
							isSelected={result.item.id === selectedBlockId}
						/>
					))}
				</Menu>
			</Scrollable>
		</View>
	);
}

function SearchContentView({ selectedBlock, selectedBlockId }) {
	const scrollNodeRef = React.useRef();

	React.useEffect(() => {
		scrollNodeRef.current.scrollTop = 0;
	}, [selectedBlockId]);

	return (
		<Surface
			borderLeft
			css={{
				flex: '1',
				height: '100%',
			}}
		>
			<Scrollable
				ref={scrollNodeRef}
				css={{
					height: '100%',
					padding: ui.space(3),
				}}
			>
				{selectedBlock && (
					<SearchContent {...selectedBlock}>
						<View>[[Example Here]]</View>
					</SearchContent>
				)}
			</Scrollable>
		</Surface>
	);
}

export default function Home() {
	const [searchQuery, setSearchQuery] = React.useState('');
	const [selectedBlockId, setSelectedBlockId] = React.useState('');
	const [showJump, setShowJump] = React.useState(false);

	const searchList = fuse.search(searchQuery);
	const hasSearchResults = !!searchList.length;
	const selectedBlock = blocksAndPatterns.find(
		(b) => b.id === selectedBlockId
	);

	React.useEffect(() => {
		if (!showJump) {
			setSearchQuery('');
		}
	}, [showJump]);

	React.useEffect(() => {
		const handleOnKeyDown = (event) => {
			const { key } = event;
			if (key === 'j' || key === 'J') {
				if (event.metaKey) {
					setShowJump((prev) => !prev);
					event.preventDefault();
				}
			}
			if (key === 'Escape') {
				setShowJump(false);
				event.preventDefault();
			}
		};

		window.addEventListener('keydown', handleOnKeyDown);

		return () => {
			window.removeEventListener('keydown', handleOnKeyDown);
		};
	}, []);

	return (
		<View>
			<Head>
				<title>G2</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<View
				css={{
					pointerEvents: 'none',
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContents: 'center',
				}}
			>
				<View
					css={{
						fontSize: 70,
						fontWeight: 800,
						opacity: 0.2,
						textAlign: 'center',
						margin: 'auto',
					}}
				>
					Press CMD + J
				</View>
			</View>
			<View
				css={{
					margin: 'auto',
					marginTop: '10vh',
					padding: 20,
				}}
			>
				{showJump && (
					<Card
						elevation={5}
						css={{ width: '100%', maxWidth: 780, margin: 'auto' }}
					>
						<CardBody>
							<SearchInput
								autoFocus
								value={searchQuery}
								onChange={setSearchQuery}
								onReset={() => setSearchQuery('')}
							/>
						</CardBody>
						{hasSearchResults && (
							<>
								<Divider />
								<View css={{ height: '50vh' }}>
									<HStack
										alignment="topLeft"
										css={{ height: '100%' }}
										spacing={0}
									>
										<SearchResultsView
											items={searchList}
											searchQuery={searchQuery}
											selectedBlockId={selectedBlockId}
											setSelectedBlockId={
												setSelectedBlockId
											}
										/>
										<SearchContentView
											selectedBlockId={selectedBlockId}
											selectedBlock={selectedBlock}
										/>
									</HStack>
								</View>
							</>
						)}
					</Card>
				)}
			</View>
		</View>
	);
}
