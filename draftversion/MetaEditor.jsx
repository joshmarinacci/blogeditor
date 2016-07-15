class MetaEditor extends React.Component {
    editSlug() {
        this.props.onFieldChange('slug',this.refs.slug.value);
    }
    editTitle() {
        this.props.onFieldChange('title',this.refs.title.value);
    }
    formatDate(ts) {
        return moment.unix(ts).format('ddd MMM Do YYYY');
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
            <div>tags <b>{post.tags?post.tags.join(", "):""}</b></div>
            <div><button onClick={this.props.onSetDraft}>draft</button>
                <button onClick={this.props.onSetPublished}>published</button></div>
        </div>
    }
}
