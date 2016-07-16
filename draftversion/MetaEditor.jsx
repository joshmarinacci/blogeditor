class MetaEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tags:[]
        };
        if(props.post.tags) {
            this.state.tags = props.post.tags
        }
    }
    componentWillReceiveProps(props, oldProps) {
        this.setState({tags: props.post.tags});
    }
    editSlug() {
        this.props.onFieldChange('slug',this.refs.slug.value);
    }
    editTitle() {
        this.props.onFieldChange('title',this.refs.title.value);
    }
    formatDate(ts) {
        return moment.unix(ts).format('ddd MMM Do YYYY');
    }

    fromTags(tags) {
        return tags.join(", ")
    }
    editTags() {
        var newstr = this.refs.tags.value;
        this.setState({tags:newstr});
    }
    formatTags() {
        var newtags = this.refs.tags.value
            .split(",")
            .map((tag) => {
                return tag.trim();
            }).filter((tag)=>{
                return tag.length >= 1;
            });
        this.props.onFieldChange('tags',newtags);
    }

    render() {
        var post = this.props.post;
        return <div className="metadata-editor vbox">
            <div>id <b>{post.id}</b></div>
            <div><b>title</b>
                <input ref="title" type="text" value={post.title} onChange={this.editTitle.bind(this)}/>
            </div>
            <div>
                <b>Slug</b>
                <input ref='slug' type="text" value={post.slug} onChange={this.editSlug.bind(this)}/>
            </div>


            <div>date <b>{this.formatDate(post.timestamp)}</b></div>
            <div>format <b>{post.format}</b></div>
            <div>status <b>{post.status}</b></div>
            <div>tags
                <input
                    ref="tags"
                    type="text"
                    value={this.state.tags}
                    onChange={this.editTags.bind(this)}
                    onBlur={this.formatTags.bind(this)}
                />
            </div>
            <div><button onClick={this.props.onSetDraft}>draft</button>
                <button onClick={this.props.onSetPublished}>published</button></div>
        </div>
    }
}
