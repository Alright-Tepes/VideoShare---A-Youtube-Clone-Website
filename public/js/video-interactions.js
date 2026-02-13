async function toggleLike(videoId) {
    try {
        const response = await fetch(`/api/video/${videoId}/like`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            updateInteractionUI(data);
        } else {
            alert('Please login to like videos');
        }
    } catch (err) {
        console.error(err);
    }
}

async function toggleDislike(videoId) {
    try {
        const response = await fetch(`/api/video/${videoId}/dislike`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            updateInteractionUI(data);
        } else {
            alert('Please login to dislike videos');
        }
    } catch (err) {
        console.error(err);
    }
}

function updateInteractionUI(data) {
    document.getElementById('likeCount').innerText = data.likes;
    document.getElementById('dislikeCount').innerText = data.dislikes;

    const likeIcon = document.querySelector('#likeBtn i');
    const dislikeIcon = document.querySelector('#dislikeBtn i');

    if (data.liked) {
        likeIcon.style.color = 'var(--primary-color)';
    } else {
        likeIcon.style.color = '';
    }

    if (data.disliked) {
        dislikeIcon.style.color = 'var(--primary-color)';
    } else {
        dislikeIcon.style.color = '';
    }
}

async function postComment(e, videoId) {
    e.preventDefault();
    const text = document.getElementById('commentText').value;
    if (!text.trim()) return;

    try {
        const response = await fetch(`/api/video/${videoId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await response.json();
        if (data.success) {
            window.location.reload(); 
        }
    } catch (err) {
        console.error(err);
    }
}

function showReplyForm(commentId) {
    const form = document.getElementById(`replyForm-${commentId}`);
    if (form) form.style.display = 'block';
}

function hideReplyForm(commentId) {
    const form = document.getElementById(`replyForm-${commentId}`);
    if (form) form.style.display = 'none';
}

async function postReply(e, videoId, commentId) {
    e.preventDefault();
    const textInput = document.getElementById(`replyText-${commentId}`);
    const text = textInput.value;
    if (!text.trim()) return;

    try {
        const response = await fetch(`/api/video/${videoId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, parentCommentId: commentId })
        });
        const data = await response.json();
        if (data.success) {
            window.location.reload();
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteComment(videoId, commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
        const response = await fetch(`/api/video/${videoId}/comment/${commentId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            window.location.reload();
        } else {
            alert('Error deleting comment: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
    }
}
