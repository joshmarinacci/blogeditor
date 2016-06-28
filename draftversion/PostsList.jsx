class PostsList extends React.Component {
    editPost(post) {
        this.props.onSelectPost(post)
    }
    render() {
        var posts = this.props.posts.map((post,i) => {
            return <li key={i}>{post.title} <a onClick={this.editPost.bind(this,post)}>edit</a></li>
        });
        return <div className="scroll posts-list"><ul>{posts}</ul></div>
    }
}