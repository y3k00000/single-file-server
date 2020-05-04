import React, { useCallback, useState, useRef } from "react";
import ReactDom from "react-dom";
import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField, CircularProgress } from '@material-ui/core';
import { period } from "@y3k00000/after";
import { saveAs } from 'file-saver';
import "babel-polyfill";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
            width: '25ch',
        },
    },
}));

const Index = ({ }) => {
    let classes = useStyles();
    let [isClicking, setIsClicking] = useState(false);
    let [readyUrl, setReadyUrl] = useState("");
    let downloadFromUrl = useCallback(async (url) => {
        console.log(url);
        setIsClicking(true);
        try {
            new URL(url);
            let result = await fetch(`/download?url=${url}`);
            let file = await result.blob();
            setReadyUrl(URL.createObjectURL(file));
        } catch (e) {
            alert(e);
        }
        setIsClicking(false);
    }, [0]);
    const saveUrl = useCallback(() => {
        console.log(`open ${readyUrl}`);
        saveAs(readyUrl, "Snap.zip", { type: "application/zip" });
    }, [readyUrl]);
    let inputRef = useRef(React.createRef());
    return readyUrl ? (<Button variant="contained" onClick={saveUrl} color="primary">Save</Button>) : (<form className={classes.root} noValidate autoComplete="off">
        <TextField id="outlined-basic" label="Input URL" disabled={isClicking} inputRef={inputRef} variant="outlined" />
        {isClicking && (<CircularProgress color="secondary" />)}
        <Button variant="contained" disabled={isClicking} onClick={() => downloadFromUrl(inputRef.current.value)} color="primary">Download</Button>
    </form>);
}

ReactDom.render(<Index />, document.getElementById("react-container"));